use Illuminate\Foundation\Auth\EmailVerificationRequest;

public function verify(EmailVerificationRequest $request)
{
    $request->fulfill(); // marca email como verificado

    // Redireciona para o React com query param opcional
    return redirect('http://localhost:3000/email-verified?user=' . $request->user()->id);
}