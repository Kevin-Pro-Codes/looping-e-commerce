<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel & MySQL</title>
</head>
<body>
  
<div>
<?php

try {
    $database = DB::connection()->getDatabaseName();
    echo "Successfully connected with Laravel and MySQL: $database";
} catch (\Exception $e) {
    echo "Could not connect to the database. Error: " . $e->getMessage();
}

?>


</div>

</body>
</html>