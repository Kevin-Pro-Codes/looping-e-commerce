<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => 'ORD-' . $this->faker->unique()->numberBetween(1000, 9999),
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->unique()->safeEmail(),
            'customer_phone' => $this->faker->phoneNumber(),
            'customer_cpf' => $this->faker->numerify('###########'),
            'total' => $this->faker->randomFloat(2, 20, 500),
            'subtotal' => $this->faker->randomFloat(2, 20, 400),
            'shipping' => $this->faker->randomFloat(2, 0, 50),
            'discount' => $this->faker->randomFloat(2, 0, 20),
            'payment_method' => $this->faker->randomElement(['credit_card', 'pix', 'boleto']),
            'payment_status' => $this->faker->randomElement(['pending', 'paid', 'failed']),
            'stock_updated' => false,
            'status' => $this->faker->randomElement(['pending', 'processing', 'shipped', 'delivered']),
            'shipping_street' => $this->faker->streetAddress(),
            'shipping_number' => $this->faker->buildingNumber(),
            'shipping_complement' => $this->faker->secondaryAddress(),
            'shipping_neighborhood' => $this->faker->word(),
            'shipping_city' => $this->faker->city(),
            'shipping_state' => $this->faker->stateAbbr(),
            'shipping_zip_code' => $this->faker->postcode(),
            'items' => json_encode([
                [
                    'id' => $this->faker->numberBetween(1, 100),
                    'name' => $this->faker->word(),
                    'price' => $this->faker->randomFloat(2, 10, 100),
                    'quantity' => $this->faker->numberBetween(1, 5)
                ]
            ]),
            'pix_data' => json_encode([
                'qr_code' => $this->faker->text(),
                'expiration_date' => $this->faker->dateTime()->format('Y-m-d H:i:s')
            ]),
            'metadata' => json_encode([
                'source' => 'web',
                'utm_source' => $this->faker->word()
            ]),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the order is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'paid',
        ]);
    }

    /**
     * Indicate that the stock has been updated.
     */
    public function stockUpdated(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_updated' => true,
        ]);
    }
}
