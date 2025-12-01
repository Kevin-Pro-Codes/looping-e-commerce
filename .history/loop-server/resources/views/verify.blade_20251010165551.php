@component('mail::message')
# Olá {{ $user->name }}

Clique no botão abaixo para confirmar seu e-mail:

{{-- This creates a button without Laravel's English fallback --}}
@component('mail::button', ['url' => $url])
Confirmar Conta
@endcomponent

Se você não conseguir clicar no botão acima, copie e cole este link no seu navegador:  
{{ $url }}

Obrigado,<br>
Equipe Finito Shop
@endcomponent
