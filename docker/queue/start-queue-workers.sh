#!/bin/sh

# Install Composer dependencies if vendor dir is missing
if [ ! -d /var/www/vendor ]; then
    cd /var/www && composer install --no-dev --optimize-autoloader
fi

# Run Laravel migrations on startup
php artisan migrate --force

# Start Supervisor to manage queue workers
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
