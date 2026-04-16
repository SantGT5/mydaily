package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/SantGT5/mydaily-worker/mq"
)

func main() {
	errCh := make(chan error, 1)

	go func() {
		errCh <- mq.StartWorker()
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	defer signal.Stop(sigCh)

	select {
	case err := <-errCh:
		if err != nil {
			log.Fatalf("worker crashed: %v", err)
		}
	case <-sigCh:
		log.Println("Reloading (MQ Worker reloading)...")
	}
}
