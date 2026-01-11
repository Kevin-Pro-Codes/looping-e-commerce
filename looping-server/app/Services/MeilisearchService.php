<?php

namespace App\Services;

use MeiliSearch\Client;

class MeilisearchService
{
    protected Client $client;

    public function __construct()
    {
        $this->client = new Client(
            config('services.meilisearch.host', env('MEILISEARCH_HOST', 'http://localhost:7700')),
            config('services.meilisearch.api_key', env('MEILISEARCH_API_KEY'))
        );
    }

    public function getClient(): Client
    {
        return $this->client;
    }

    public function createIndex(string $indexName, array $options = []): array
    {
        return $this->client->createIndex($indexName, $options);
    }

    public function indexDocuments(string $indexName, array $documents, string $primaryKey = null): array
    {
        $index = $this->client->index($indexName);
        
        if ($primaryKey) {
            $index->update(['primaryKey' => $primaryKey]);
        }

        return $index->addDocuments($documents);
    }

    public function search(string $indexName, string $query, array $options = []): array
    {
        $index = $this->client->index($indexName);
        return $index->search($query, $options);
    }

    public function deleteIndex(string $indexName): array
    {
        return $this->client->deleteIndex($indexName);
    }

    public function getIndexes(): array
    {
        return $this->client->getIndexes();
    }

    public function updateIndexSettings(string $indexName, array $settings): array
    {
        $index = $this->client->index($indexName);
        return $index->updateSettings($settings);
    }
}
