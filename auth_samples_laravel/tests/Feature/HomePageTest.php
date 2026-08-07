<?php

namespace Tests\Feature;

use Tests\TestCase;

class HomePageTest extends TestCase
{
    public function test_home_page_is_available_without_exposing_tokens(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertDontSee('Access token');
    }
}
