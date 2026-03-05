# 🛡️ Tuurio Auth Samples

**The fastest way to integrate secure, modern identity into your organization.**

This repository contains production-ready sample clients for [Tuurio ID](https://id.tuurio.com). Whether you are building a React SPA for a sports club, a mobile app for a kindergarten, or securing a legacy business intranet, these samples provide the blueprint for a secure **OAuth 2.1** integration.

[![Open in Gitpod](https://img.shields.io/badge/Gitpod-Ready-blue?logo=gitpod)](https://gitpod.io/#https://github.com/tuurio/auth-samples)
[![Tuurio ID](https://img.shields.io/badge/Powered%20by-Tuurio%20ID-blue)](https://id.tuurio.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Why Tuurio ID?

Tuurio is more than just a "Login Button." It is an **Identity-as-a-Service (IDaaS)** platform built for the specific needs of clubs, social institutions, and SMEs.

* **Tuurio Vault:** Securely store and manage sensitive member data (IBAN, emergency contacts, custom attributes) directly within the identity layer.
* **Legacy Shield:** Add MFA, Passkeys, and modern SSO to your existing "old" software without changing a single line of code.
* **Privacy First:** European-hosted, GDPR-compliant, and designed for high-trust environments.

---

## 📦 Included Demos

All samples utilize the **Authorization Code Flow + PKCE** (Proof Key for Code Exchange) to ensure maximum security for both public and confidential clients.

### Web SPAs (Public Clients)
| Framework | Tech Stack | Setup Guide |
| :--- | :--- | :--- |
| **React** | Vite + `oidc-client-ts` | [Explore](./auth_samples_react) |
| **Vue 3** | Vite + Composition API | [Explore](./auth_samples_vue3) |
| **Angular** | Standalone Components | [Explore](./auth_samples_angular) |
| **Next.js** | App Router + Auth.js | [Explore](./auth_samples_nextjs) |

### Mobile & Native
| Platform | Tech Stack | Auth Method |
| :--- | :--- | :--- |
| **Android** | Jetpack Compose | App Links / Custom Scheme |
| **iOS** | SwiftUI + AppAuth | Universal Links |
| **Flutter** | `flutter_appauth` | Secure Deep-linking |

### Server-Side (Confidential Clients)
| Language | Framework | Token Storage |
| :--- | :--- | :--- |
| **Node.js** | Express | Session / Redis |
| **Python** | Flask | Flask Session |
| **Go** | net/http | Secure Cookie |
| **Java** | Spring Boot 3 | HTTP Session |
| **PHP** | Vanilla / Laravel | PHP Session |

---

## 🛠️ Quick Start

1.  **Create a Tenant:** Sign up at [Tuurio ID](https://id.tuurio.com) and create your organization's tenant (e.g., `my-club.id.tuurio.com`).
2.  **Register your Client:** In the Developer Console, create a new application and whitelist your redirect URIs (e.g., `http://localhost:5173`).
3.  **Run a Sample:**
    ```bash
    git clone [https://github.com/tuurio/auth-samples.git](https://github.com/tuurio/auth-samples.git)
    cd auth_samples_react
    cp .env.example .env
    # edit .env with your issuer/client/redirect values
    npm install
    npm run dev
    ```

---

## 💎 The Tuurio Ecosystem

Tuurio ID scales with your organization. Choose the module that fits your needs:

### 🛡️ Legacy Shield
Protect your intranet, admin tools, or legacy servers. Tuurio Shield acts as a modern security gatekeeper (Proxy) in front of your old software. **No VPN required.**

### 🗝️ Tuurio Vault (Premium)
The "Smart Profile" for your members.
* **Self-Service:** Members update their own IBAN and address.
* **Custom Attributes:** Add fields like "Allergies" or "Emergency Contact".
* **SEPA-Ready:** Generate valid direct debit mandates directly from verified profile data.

---

## 💡 Developer Features

* **SSO Hub Support:** These samples demonstrate how to use `prompt=none` and `sso=auto` for a seamless "One-Click" login experience.
* **Account Chooser:** Support for the Tuurio Account Chooser, allowing users to switch between multiple club identities easily.
* **Claims Inspection:** Every sample includes a "Debug View" to inspect decoded ID and Access Tokens.

---

**Built with ❤️ for a secure community.** [Tuurio ID](https://id.tuurio.com)
