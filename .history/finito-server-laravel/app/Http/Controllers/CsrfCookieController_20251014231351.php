<?php

namespace Laravel\Sanctum\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\Response;

class CsrfCookieController extends Controller
{
    /**
     * Return an empty response with the XSRF-TOKEN cookie.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function show(Request $request): Response
    {
        return response()->noContent();
    }
}
