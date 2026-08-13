# E-Commerce Store

A full-stack e-commerce application built as a learning project — Django REST Framework on the
backend, React on the frontend, Stripe for payments.

> **Status:** in development.

---

## Tech stack

**Backend**
- Django + Django REST Framework
- SimpleJWT for authentication (with token blacklisting)
- django-cors-headers, django-filter
- django-environ for settings/secrets
- Stripe Python SDK
- SQLite (development)

**Frontend**
- React 19 + Vite
- React Router 7
- Axios
- Stripe.js / React Stripe.js
- React Hook Form
- react-hot-toast
- Bootstrap 5 + Bootstrap Icons (loaded via CDN in `index.html`)
- Custom CSS design tokens (`src/assets/global/tokens.css`)

---

## Features

- Product catalogue with categories, variations (size/colour), a multi-image gallery and pagination
- Sale pricing — products can carry a `sale_price`, and the discount percentage is derived
- Product search (navbar search box → backend `SearchFilter` over name, description and
  category), plus price range, in-stock, minimum-rating and ordering filters on the store page
- Product reviews and ratings, with average rating shown on the product card and detail page;
  reviewers can edit or delete their own review
- Cart supporting both logged-in users and guests
- Wishlist (add, remove, clear)
- Address book — multiple saved addresses per user, with a default address used at checkout
- JWT authentication with OTP-based email verification, resend-OTP, and password reset
- Account dashboard — profile summary, recent orders, wishlist highlights
- Checkout with a Stripe payment flow
- Order history with per-line price snapshots, status filter tabs and pagination
- Order confirmation emails
- Newsletter signup on the home page (sends a welcome email)
- `seed_products` management command that fills the catalogue with demo products and images

---

## Project structure

```
E Commerce Store/
├── env/                        # Python virtualenv (not committed)
├── .gitignore
├── backend/
│   ├── manage.py
│   ├── db.sqlite3              # not committed
│   ├── .env                    # backend secrets (not committed)
│   ├── requirements.txt
│   ├── api.http                # scratch requests for manual API testing
│   ├── ecomstore/              # settings, root urls
│   ├── accounts/               # auth, registration, email verification
│   ├── store/                  # products, images, variations, reviews
│   │   └── management/commands/seed_products.py
│   ├── category/
│   ├── cart/
│   ├── order/                  # orders, payments, Stripe webhook, services.py
│   ├── wishlist/
│   ├── address/                # saved shipping addresses
│   └── newsletter/             # newsletter subscribe endpoint
└── frontend/
    └── ecomstore-frontend/
        ├── .env                # frontend env vars (not committed)
        └── src/
            ├── pages/
            ├── components/
            ├── context/        # CartContext, CategoryContext
            ├── router/
            ├── assets/global/  # tokens.css, style.css
            └── utils/          # api.js, auth.js, toast.jsx
```

---

## Prerequisites

- Python 3.12
- Node.js 18+
- A [Stripe account](https://dashboard.stripe.com/register) (test mode is fine)
- The [Stripe CLI](https://stripe.com/docs/stripe-cli) — **required for local development**, see
  [Why the Stripe CLI matters](#why-the-stripe-cli-matters)

---

## Setup

### Backend

```bash
# from the repo root
python3 -m venv env
source env/bin/activate

pip install -r backend/requirements.txt

cd backend
# create backend/.env first — see Environment variables below
python manage.py migrate
python manage.py createsuperuser

# optional: fill the catalogue with demo products (needs `requests` installed
# and downloads placeholder images, so it needs internet access)
python manage.py seed_products
```

> `seed_products` **deletes all existing products** before inserting the demo set.

### Frontend

```bash
cd frontend/ecomstore-frontend
npm install
```

---

## Environment variables

### Backend — `backend/.env`

Loaded by `django-environ` in `ecomstore/settings.py`. The file is gitignored; create it yourself.

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for local development |
| `ALLOWED_HOSTS` | Comma-separated host list (may be empty while `DEBUG=True`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) — printed by `stripe listen` |
| `EMAIL_HOST_USER` | Gmail address used to send OTP / order / newsletter emails |
| `EMAIL_HOST_PASSWORD` | Gmail **app password**, not your account password |
| `FRONTEND_URL` | Base URL used in emailed links (defaults to `http://localhost:5173`) |

### Frontend — `frontend/ecomstore-frontend/.env`

| Variable | Description |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

Vite only exposes variables prefixed with `VITE_` to the browser.

⚠️ **Do not commit real keys.** Both `.env` files are covered by `.gitignore`, along with `env/`,
`db.sqlite3`, `__pycache__/`, `node_modules/` and `media/`.

---

## Running the app

You need **three terminals**.

**1 — Django**

```bash
source env/bin/activate
cd backend
python manage.py runserver
```
→ http://localhost:8000

**2 — Vite**

```bash
cd frontend/ecomstore-frontend
npm run dev
```
→ http://localhost:5173

**3 — Stripe webhook forwarding**

```bash
stripe listen --forward-to localhost:8000/order/stripe-webhook/
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET` in `backend/.env` and restart Django.
If it doesn't match, every webhook fails signature verification and returns 400.

---

## Why the Stripe CLI matters

Stripe's servers live on the internet. Your Django server runs on `localhost`. **Stripe cannot
reach it.** `stripe listen` opens a tunnel and forwards events to your machine.

Without it, payments succeed on Stripe's side but your app never finds out:

- the order stays `New` with `is_ordered=False`
- stock is never decremented
- the cart is never cleared
- no confirmation email is sent

There is a fallback — `ConfirmOrderView` (`POST order/<order_number>/confirm/`) is called by the
order success page and asks Stripe directly whether the payment went through. That covers the case
where the webhook is late or missing, but only if the customer actually lands back on the success
page. Keep the CLI running.

---

## Testing payments

Use Stripe's test cards. Any future expiry date, any CVC, any postcode.

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Declined (insufficient funds) |

### Verifying an order completed

```bash
cd backend
python manage.py shell
```
```python
from order.models import Order, Payment
Order.objects.order_by('-id').first().status   # should be 'Completed'
Payment.objects.count()                        # should increase by 1
```

---

## Payment flow

Worth understanding, because it's the subtle part of the app:

```
1. POST order/place/          Cancels any earlier unpaid order for this user,
                              then creates a new Order from the cart.
                              The cart is deliberately NOT emptied here.

2. POST order/create_payment/ Creates (or reuses) a Stripe PaymentIntent and
                              returns its client_secret. An idempotency key
                              prevents duplicate intents.

3. Browser → Stripe           Card details go straight to Stripe. They never
                              touch the Django server.

4. Fulfilment — two routes racing:
   a) Webhook       Stripe POSTs payment_intent.succeeded to the server
   b) Confirm view  The success page asks Stripe directly

   Both call fulfil_order() in order/services.py, which claims the order with
   a single atomic UPDATE. Whichever arrives first does the work; the other
   no-ops.

5. fulfil_order()             Marks paid, records the Payment, decrements
                              stock, removes only the ordered lines from the
                              cart, then queues the confirmation email via
                              transaction.on_commit.
```

Two design points worth knowing:

- **The cart isn't cleared until payment succeeds**, and only the lines that were actually
  ordered are removed — matched by product *and* variation set. Anything added after placing the
  order survives.
- **`OrderProduct.product_price` is a snapshot.** Changing a product's price later does not
  rewrite past orders.

---

## API endpoints

Base URL: `http://localhost:8000/`

| Prefix | Purpose |
|---|---|
| `admin/` | Django admin |
| `accounts/` | Register, verify email (OTP), resend OTP, login, current user (`me/`), logout, token refresh, forgot/reset password |
| `store/` | Product list (paginated, searchable, filterable), featured products, category listing, product detail, product reviews, review detail |
| `category/` | Category list |
| `cart/` | View cart, add, increase/decrease quantity, remove, clear |
| `wishlist/` | List, add, remove, clear |
| `address/` | Address CRUD (DRF router) + `POST address/<id>/set_default/` |
| `order/` | Place order, payment intent, webhook, confirm, list, detail |
| `newsletter/` | `POST newsletter/subscribe/` |

`backend/api.http` holds ready-made requests for poking these by hand.

---

