@extends('layouts.app')

@section('content')
    <section class="panel">
        <div class="panel-header">
            <div>
                <span class="eyebrow">Logout complete</span>
                <h3>Local session removed</h3>
            </div>
        </div>
        <p class="muted">
            The Laravel session has been cleared and the identity provider logout endpoint was called.
            You can start a fresh sign-in flow now.
        </p>
        <a class="button primary" href="{{ route('home') }}">Back to home</a>
    </section>
@endsection
