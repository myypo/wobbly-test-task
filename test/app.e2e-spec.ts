import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Auth } from '../src/auth/entities/auth.entity';
import { Product } from '../src/products/entities/product.entity';
import { Reflector } from '@nestjs/core';
import { LoginDto, RegisterDto } from '../src/auth/dto';
import { ResponseInterceptor } from '../src/response/response.interceptor';
import {
  CreateProductDto,
  ListProductsDto,
  UpdateProductDto,
} from '../src/products/dto';
import { ProductsModule } from '../src/products/products.module';

let TOKEN_TESTED: string;
let TOKEN_REGISTRATION: string;

describe('AuthContoller (e2e)', () => {
  let app: INestApplication;

  const username = 'ValidUsername';
  const password = 'validpass1513';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule, UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
      new ResponseInterceptor(),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) -> Can create a new user with valid username and password', async () => {
    const reqBody: RegisterDto = { username, password };

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(reqBody)
      .expect(201)
      .then((res) => {
        const userGot: User = res.body.data.user;
        expect(typeof userGot.id).toBe('string');
        expect(userGot.username).toStrictEqual(reqBody.username);
        expect(userGot.hashedPassword).toBeUndefined();

        const tokenGot: string = res.body.data.accessToken;
        expect(typeof tokenGot).toBe('string');
        expect(tokenGot.length).toBeGreaterThan(25);
        expect(tokenGot).toMatch('eyJh');

        // Use it in other tests
        TOKEN_REGISTRATION = tokenGot;
      });
  });

  it('/auth/register (POST) -> Not possible to create a user with a password that is too short', async () => {
    const reqBody: RegisterDto = {
      username: 'validnamebutpassisshort',
      password: 'short',
    };

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(reqBody)
      .expect(400)
      .then((res) => {
        const dataGot: User = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });

  it('/auth/register (POST) -> Returns Conflict code on trying to create an user with a non-unique username', async () => {
    const reqBody: RegisterDto = {
      username,
      password,
    };

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(reqBody)
      .expect(409)
      .then((res) => {
        const dataGot: User = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });

  it('/auth/login (POST) -> Can login with the just created user', async () => {
    const reqBody: LoginDto = { username, password };

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(reqBody)
      .expect(200)
      .then((res) => {
        const authGot: Auth = res.body.data;

        const userGot: User = authGot.user;
        expect(typeof userGot.id).toBe('string');
        expect(userGot.username).toStrictEqual(reqBody.username);
        expect(userGot.hashedPassword).toBeUndefined();

        const tokenGot: string = authGot.accessToken;
        expect(typeof tokenGot).toBe('string');
        expect(tokenGot.length).toBeGreaterThan(25);
        expect(tokenGot).toMatch('eyJh');

        // Use it in other tests
        TOKEN_TESTED = tokenGot;
      });
  });

  it('/auth/login (POST) -> Not possible to login with an invalid password', async () => {
    const reqBody: LoginDto = { username, password: 'Ia15mveryInvalid150' };

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(reqBody)
      .expect(401)
      .then((res) => {
        const dataGot = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });
});

describe('ProductsContoller (e2e)', () => {
  let app: INestApplication;

  let PRODUCT_ID_TESTED: string;

  const initProduct: CreateProductDto = {
    name: 'vase',
    description: 'very fancy',
    category: 'kitchenware',
    price: 9001,
  };
  const updatedProduct: UpdateProductDto = {
    name: 'newvase',
    description: 'more fancy',
    category: 'relic',
    price: 99999999,
  };

  const nameSecondProduct = 'lightbulb';
  const secondProduct: CreateProductDto = {
    name: nameSecondProduct,
    description: 'strong',
    category: 'light',
    price: 3,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ProductsModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
      new ResponseInterceptor(),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (POST) -> Can create a new product when providing valid data', async () => {
    const reqBody = initProduct;

    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .send(reqBody)
      .expect(201)
      .then((res) => {
        const productGot: Product = res.body.data;
        expect(productGot).toMatchObject(reqBody);
        const uuidLen = 36;
        const idProductGot = productGot.id;
        expect(idProductGot.length).toEqual(uuidLen);

        PRODUCT_ID_TESTED = idProductGot;
      });
  });

  it('/products (POST) -> Impossible to create a new product with a descripton field absent', async () => {
    const reqBody = {
      name: 'nodescwontcreate',
      //description: 'i am not defined',
      category: 'none',
      price: 400,
    } as CreateProductDto;

    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .send(reqBody)
      .expect(400)
      .then((res) => {
        const dataGot: Product = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });

  it('/products (POST) -> Impossible to create a new product without valid JWT', async () => {
    const reqBody: CreateProductDto = {
      name: 'noauthwontcreate',
      description: 'somevaliddesc',
      category: 'noauth',
      price: 999,
    };

    return (
      request(app.getHttpServer())
        .post('/products')
        // No auth used
        .send(reqBody)
        .expect(401)
        .then((res) => {
          const dataGot: Product = res.body.data;
          expect(dataGot).toBeUndefined();
        })
    );
  });

  it('/products (GET) -> Can retrieve the initial product', async () => {
    return request(app.getHttpServer())
      .get(`/products/${PRODUCT_ID_TESTED}`)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(200)
      .then((res) => {
        const productGot: Product = res.body.data;
        expect(productGot).toMatchObject(initProduct);
      });
  });

  it('/products (PATCH) -> Can update an existing valid product with valid data and JWT', async () => {
    const reqBody = updatedProduct;

    return request(app.getHttpServer())
      .patch(`/products/${PRODUCT_ID_TESTED}`)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .send(reqBody)
      .expect(200)
      .then((res) => {
        const productGot: Product = res.body.data;
        expect(productGot).toMatchObject(reqBody);
        const uuidLen = 36;
        const idProductGot = productGot.id;
        expect(idProductGot.length).toEqual(uuidLen);

        PRODUCT_ID_TESTED = idProductGot;
      });
  });

  it('/products (PATCH) -> Impossible to perform any updates without a valid JWT', async () => {
    const reqBody: UpdateProductDto = {
      name: 'nojwtvaseupd',
      description: 'nojwtupdate',
      category: 'nojwtnoupdate',
      price: 9222,
    };

    return (
      request(app.getHttpServer())
        .patch(`/products/${PRODUCT_ID_TESTED}`)
        // No JWT
        .send(reqBody)
        .expect(401)
        .then((res) => {
          const dataGot: Product = res.body.data;
          expect(dataGot).toBeUndefined();
        })
    );
  });

  it('/products (PATCH) -> Impossible to perform any updates without providing a product id', async () => {
    const reqBody: UpdateProductDto = {
      name: 'noidvase',
      description: 'notgonnaupdate',
      category: 'updatenone',
      price: 9222,
    };

    return request(app.getHttpServer())
      .patch('/products') // no id provided
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .send(reqBody)
      .expect(404)
      .then((res) => {
        const dataGot: Product = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });

  it('/products (POST) -> Can create a new product with valid data and the JWT acquired from registration', async () => {
    const reqBody = secondProduct;

    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${TOKEN_REGISTRATION}`)
      .send(reqBody)
      .expect(201)
      .then((res) => {
        const productGot: Product = res.body.data;
        expect(productGot).toMatchObject(reqBody);
        const uuidLen = 36;
        const idProductGot = productGot.id;
        expect(idProductGot.length).toEqual(uuidLen);
      });
  });

  it('/products (GET) -> Can retrieve the updated product', async () => {
    return request(app.getHttpServer())
      .get(`/products/${PRODUCT_ID_TESTED}`)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(200)
      .then((res) => {
        const productGot: Product = res.body.data;
        expect(productGot).toMatchObject(updatedProduct);
      });
  });

  it('/products (GET) -> Returns 404 on non existing product id', async () => {
    return request(app.getHttpServer())
      .get(`/products/61a9de70-de7b-4d27-bb2c-cdacf551f9d4`)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(404)
      .then((res) => {
        const dataGot = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });

  it('/products (GET) -> Can retrieve all products that we have created', async () => {
    return request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(200)
      .then((res) => {
        const productsListGot: Product[] = res.body.data;
        expect(productsListGot.length).toEqual(2);
        expect(productsListGot).toMatchObject([updatedProduct, secondProduct]);
      });
  });

  it('/products (GET) -> Can filter out first product by name', async () => {
    return request(app.getHttpServer())
      .get('/products')
      .query({ name: nameSecondProduct } as ListProductsDto)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(200)
      .then((res) => {
        const productsListGot: Product[] = res.body.data;
        expect(productsListGot.length).toEqual(1);
        expect(productsListGot).toMatchObject([secondProduct]);
      });
  });

  it('/products (GET) -> Can filter out one product by skip 1', async () => {
    return request(app.getHttpServer())
      .get('/products')
      .query({ skip: 1 } as ListProductsDto)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(200)
      .then((res) => {
        const productsListGot: Product[] = res.body.data;
        expect(productsListGot.length).toEqual(1);
      });
  });

  it('/products (GET) -> Asking for products with a filter that does not match anything returns an empty array', async () => {
    return request(app.getHttpServer())
      .get('/products')
      .query({
        category: 'that does never match',
      } as ListProductsDto)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(200)
      .then((res) => {
        const productsListGot: Product[] = res.body.data;
        expect(productsListGot.length).toEqual(0);
        expect(productsListGot).toStrictEqual([]);
      });
  });

  it('/products (DELETE) -> Impossible to delete a product with an invalid JWT', async () => {
    return request(app.getHttpServer())
      .delete(`/products/${PRODUCT_ID_TESTED}`)
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
      ) // invalid JWT
      .expect(401)
      .then((res) => {
        const dataGot: Product = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });

  it('/products (DELETE) -> Can delete a product', async () => {
    return request(app.getHttpServer())
      .delete(`/products/${PRODUCT_ID_TESTED}`)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(204)
      .then((res) => {
        const dataGot: Product = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });

  it('/products (GET) -> Returns 404 on a product that has been deleted', async () => {
    return request(app.getHttpServer())
      .get(`/products/${PRODUCT_ID_TESTED}`)
      .set('Authorization', `Bearer ${TOKEN_TESTED}`)
      .expect(404)
      .then((res) => {
        const dataGot = res.body.data;
        expect(dataGot).toBeUndefined();
      });
  });
});
