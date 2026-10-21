<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TestRabbitMQJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private string $message
    ) {
        $this->onQueue('payments.normal_priority');
    }

    public function handle(): void
    {
        Log::info('RabbitMQ Test Job Executed', [
            'message' => $this->message,
            'timestamp' => now()->toISOString(),
            'queue_connection' => config('queue.default')
        ]);
    }
}
