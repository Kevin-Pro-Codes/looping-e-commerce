<?php

namespace App\Services;

use MongoDB\Client;

class ProductService
{
    protected $collection;

    public function __construct()
    {
        $client = new Client(env('MONGO_URI', 'mongodb://127.0.0.1:27017'));
        $this->collection = $client->selectDatabase(env('MONGO_DB', 'mydb'))
                                    ->selectCollection('products');
    }

    public function all()
    {
        return $this->collection->find()->toArray();
    }

    public function find(string $id)
    {
        $objectId = new \MongoDB\BSON\ObjectId($id);
        return $this->collection->findOne(['_id' => $objectId]);
    }

    public function create(array $data)
    {
        $result = $this->collection->insertOne($data);
        return $result->getInsertedId();
    }

    public function update(string $id, array $data)
    {
        $objectId = new \MongoDB\BSON\ObjectId($id);
        $result = $this->collection->updateOne(
            ['_id' => $objectId],
            ['$set' => $data]
        );
        return $result->getModifiedCount();
    }

    public function delete(string $id)
    {
        $objectId = new \MongoDB\BSON\ObjectId($id);
        $result = $this->collection->deleteOne(['_id' => $objectId]);
        return $result->getDeletedCount();
    }
}
