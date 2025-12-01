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

    // other CRUD methods...
}
