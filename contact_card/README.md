# Tuurio contact card

Independent Spring Boot 4 / Java 21 application for the trade-fair contact card.
Uses the same Spring Security OIDC integration as the Java sample and the existing
STACKIT deployment conventions. It is separate from ONE ID and provides no ONE ID
account management.

The initial build slice provides the Gradle wrapper, package build, container and
CI gate. Contact-card behavior, configuration, migrations, security and regression
tests follow together in the next slice. This bootstrap alone is not deployable.

```sh
./gradlew test bootJar
```

Do not deploy before the automatic Mini review and required checks have passed on
the exact release head.
