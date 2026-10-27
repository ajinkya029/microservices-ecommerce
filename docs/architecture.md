# Architecture

```text
Client / Postman
      |
      v
API Gateway :8080
  |         |          |
  v         v          v
Auth      Product     Order
:4001     :4002       :4003
  |         |          | \
  v         v          v  \ HTTP lookup
MongoDB logical databases (auth, products, orders) <--- Product Service
```

## Service ownership

- Auth owns users and issues JWTs.
- Product owns product catalog records.
- Order owns order records and asks Product for current product details during order creation.
- Gateway provides a single public entry point.

## Important limitations

This starter checks stock but does **not reserve/decrement inventory**, so concurrent orders can oversell. The product lookup and order write are not a distributed transaction. Add an Inventory service with atomic reservation and a saga/outbox pattern before production use.
