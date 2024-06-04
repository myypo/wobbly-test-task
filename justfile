default: 
    just --list --unsorted

@dev:
    #!/usr/bin/env bash

    set -a
    source .env.local
    set +a

    docker-compose --file local.docker-compose.yaml up --detach
    until docker exec wobbly-database pg_isready -p 5432 ; do sleep 0.25 ; done

    prisma migrate dev --name init
    prisma generate
    pnpm start:dev

@e2e:
    #!/usr/bin/env bash

    set -a
    source .env.e2e
    set +a

    docker-compose --file e2e.docker-compose.yaml up --detach
    until docker exec wobbly-e2e-database pg_isready -p 6969 ; do sleep 0.25 ; done

    prisma migrate dev --name init
    prisma generate

    pnpm run test:e2e || true

    docker stop wobbly-e2e-database
    docker rm wobbly-e2e-database
    docker volume rm wobbly-test-task_wobbly-e2e-data


@debug:
    #!/usr/bin/env bash

    set -a
    source .env.local
    set +a

    docker-compose --file local.docker-compose.yaml up --detach
    until docker exec wobbly-database pg_isready -p 5432 ; do sleep 0.25 ; done

    prisma migrate dev --name init
    prisma generate
    pnpm run start:debug

@prod:
    pnpm install
    pnpm run build
    pnpm run start:prod

@lint:
    pnpm run lint
