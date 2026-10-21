<?php

namespace App\Jobs;

use App\Services\RabbitMQService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

abstract class RabbitMQJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $queueName;

    public function __construct()
    {
        $this->onQueue('database'); // Use database queue for dispatching
    }

    public function handle(): void
    {
        $rabbitMQ = new RabbitMQService();
        
        if (!$rabbitMQ->isConnected()) {
            Log::error('RabbitMQ not available, falling back to direct processing');
            $this->execute();
            return;
        }

        $jobData = [
            'job_class' => static::class,
            'data' => $this->getJobData(),
            'attempts' => $this->attempts(),
            'created_at' => now()->toISOString()
        ];

        $success = $rabbitMQ->publish($this->queueName, $jobData);

        if (!$success) {
            Log::error('Failed to publish to RabbitMQ, executing directly');
            $this->execute();
        } else {
            Log::info('Job published to RabbitMQ', [
                'queue' => $this->queueName,
                'job_class' => static::class
            ]);
        }
    }

    abstract protected function execute(): void;
    abstract protected function getJobData(): array;
}
