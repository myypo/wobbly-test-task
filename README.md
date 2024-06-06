## Description

Simple **Node.js** CRUD API with basic JWT auth built with, among other things: **Nest.js**, **Prisma** and **Postgres**.

## Satisfied requirements

1. Follows the RESTful standards and allows to manage products with `name`, `description`, `price` and `category` fields.
2. Has endpoints for creating products **POST**, retrieving a single product by id **GET**, retrieving many products according to a filter **GET**, update in a **PATCH** way and **DELETE** by id.
3. Utilizes a basic JWT Bearer auth, provided by **Passport**, which can be acquired by registration or login into an existing account.
4. Follows REST: plural convention for managing resources, param id for specifying the requested resource, appropriate error codes etc.
5. Since there is no custom logic in the requirements e2e tests make much more sense than the unit ones. Therefore all endpoints are tested with **Jest**/**Supertest** according to the Nest.js provided spec.
6. There are tests for both happy paths and erroneous inputs. I used these tests to simplify the development and made it easy for myself to run them with a simple script in justfile task runner.
7. The server has been deployed in a simple configuration to the cloud on a single WM and I have provided the URL privately. For deployment I utilized **Nix** to install the runtime and operations dependencies, **pm2** to run the server as a daemon and **Docker** to make it easier to manage the DB on the same host.
