<?php

namespace App\Services;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use Illuminate\Support\Facades\Log;

class RabbitMQService
{
    private ?AMQPStreamConnection $connection = null;
    private ?\PhpAmqpLib\Channel\AMQPChannel $channel = null;

    public function __construct()
    {
        $this->connect();
    }

    private function connect(): void
    {
        try {
            $this->connection = new AMQPStreamConnection(
                env('RABBITMQ_HOST', '127.0.0.1'),
                env('RABBITMQ_PORT', 5672),
                env('RABBITMQ_USER', 'admin'),
                env('RABBITMQ_PASSWORD', 'rabbitmq_password'),
                env('RABBITMQ_VHOST', '/')
            );

            $this->channel = $this->connection->channel();
            
            Log::info('Connected to RabbitMQ successfully');
        } catch (\Exception $e) {
            Log::error('Failed to connect to RabbitMQ: ' . $e->getMessage());
            $this->connection = null;
            $this->channel = null;
        }
    }

    public function publish(string $queue, array $data): bool
    {
        if (!$this->isConnected()) {
            return false;
        }

        try {
            // Declare queue
            $this->channel->queue_declare($queue, false, true, false, false);

            // Create message
            $message = new AMQPMessage(
                json_encode($data),
                ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
            );

            // Publish message
            $this->channel->basic_publish($message, '', $queue);

            Log::info('Message published to RabbitMQ', [
                'queue' => $queue,
                'data' => $data
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to publish message to RabbitMQ: ' . $e->getMessage());
            return false;
        }
    }

    public function consume(string $queue, callable $callback): void
    {
        if (!$this->isConnected()) {
            Log::error('Cannot consume RabbitMQ messages - not connected');
            return;
        }

        try {
            // Declare queue
            $this->channel->queue_declare($queue, false, true, false, false);

            // Set up consumer
            $this->channel->basic_consume(
                $queue,
                '',
                false,
                true,
                false,
                false,
                function ($message) use ($callback) {
                    try {
                        $data = json_decode($message->body, true);
                        $callback($data);
                        $message->ack();
                    } catch (\Exception $e) {
                        Log::error('Error processing RabbitMQ message: ' . $e->getMessage());
                        $message->nack();
                    }
                }
            );

            Log::info('Starting RabbitMQ consumer for queue: ' . $queue);

            // Keep consuming
            while ($this->channel->is_consuming()) {
                $this->channel->wait();
            }
        } catch (\Exception $e) {
            Log::error('RabbitMQ consumer error: ' . $e->getMessage());
        }
    }

    public function isConnected(): bool
    {
        return $this->connection && $this->connection->isConnected() && 
               $this->channel && $this->channel->is_open();
    }

    public function __destruct()
    {
        try {
            if ($this->channel && $this->channel->is_open()) {
                $this->channel->close();
            }
            if ($this->connection && $this->connection->isConnected()) {
                $this->connection->close();
            }
        } catch (\Exception $e) {
            Log::error('Error closing RabbitMQ connection: ' . $e->getMessage());
        }
    }
}
