# E-Commerce Store

A full-stack e-commerce application built as a learning project — Django REST Framework on the
backend, React on the frontend, Stripe for payments.

> **Status:** in development. See [Known gaps](#known-gaps) for what isn't finished.

---

## Tech stack

**Backend**
- Django + Django REST Framework
- SimpleJWT for authentication (with token blacklisting)
- django-cors-headers, django-filter
- Stripe Python SDK
- SQLite (development)

**Frontend**
- React 19 + Vite
- React Router 7
- Axios
- Stripe.js / React Stripe.js
- React Hook Form
- Bootstrap 5 + Bootstrap Icons (loaded via CDN in `index.html`)

---

## Features

- Product catalogue with categories, variations (size/colour) and pagination
- Product search (navbar search box → backend `SearchFilter` over name, description and
  category), plus price range, in-stock and ordering filters on the store page
- Product reviews and ratings, with average rating shown on the product card and detail page
- Cart supporting both logged-in users and guests
- Wishlist
- JWT authentication with OTP-based email verification, resend-OTP, and password reset
- Checkout with a Stripe payment flow
- Order history with per-line price snapshots, status filter tabs and pagination
- Order confirmation emails

---

## Project structure

```
E Commerce Store/
├── env/                        # Python virtualenv (not committed)
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── requirements.txt
│   ├── ecomstore/              # settings, root urls
│   ├── accounts/               # auth, registration, email verification
│   ├── store/                  # products, variations
│   ├── category/
│   ├── cart/
│   ├── order/                  # orders, payments, Stripe webhook
│   └── wishlist/
└── frontend/
    └── ecomstore-frontend/
        ├── .env                # frontend env vars (not committed)
        └── src/
            ├── pages/
            ├── components/
            ├── router/
            └── utils/
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
python manage.py migrate
python manage.py createsuperuser
```

### Frontend

```bash
cd frontend/ecomstore-frontend
npm install
```

---

## Environment variables

### Frontend — `frontend/ecomstore-frontend/.env`

| Variable | Description |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

Vite only exposes variables prefixed with `VITE_` to the browser.

### Backend — currently in `backend/ecomstore/settings.py`

These are **hardcoded in settings.py right now** and should be moved to environment
variables (`django-environ` is already installed):

| Setting | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) — printed by `stripe listen` |
| `EMAIL_HOST_USER` | Gmail address used to send order emails |
| `EMAIL_HOST_PASSWORD` | Gmail **app password**, not your account password |

⚠️ **Do not commit real keys.** There is no `.gitignore` in this repo yet — see
[Known gaps](#known-gaps).

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

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET` in `settings.py`. If it doesn't
match, every webhook fails signature verification and returns 400.

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

   Both call fulfil_order(), which claims the order with a single atomic
   UPDATE. Whichever arrives first does the work; the other no-ops.

5. fulfil_order()             Marks paid, records the Payment, decrements
                              stock, removes only the ordered lines from the
                              cart, then queues the confirmation email via
                              transaction.on_commit.
```

Two design points worth knowing:

- **The cart isn't cleared until payment succeeds**, and only the lines that were actually
  ordered are removed. Anything added after placing the order survives.
- **`OrderProduct.product_price` is a snapshot.** Changing a product's price later does not
  rewrite past orders.

---

## API endpoints

Base URL: `http://localhost:8000/`

| Prefix | Purpose |
|---|---|
| `admin/` | Django admin |
| `accounts/` | Register, verify email (OTP), resend OTP, login, logout, token refresh, forgot/reset password |
| `store/` | Product list (paginated, searchable, filterable), category listing, product detail, product reviews |
| `category/` | Category list |
| `cart/` | View cart, add, increase/decrease quantity, remove, clear |
| `wishlist/` | List, add, remove |
| `order/` | Place order, payment intent, webhook, confirm, list, detail |

---

## Known gaps

Things that are unfinished or need attention:

- **No `.gitignore`, and this folder isn't a git repo yet.** `env/`, `db.sqlite3`, `.env`,
  `__pycache__/` and `node_modules/` all need to be excluded **before** running `git init` and
  pushing anywhere — `settings.py` currently has real-looking Stripe and Gmail credentials
  hardcoded in it (see below).
- **Secrets are hardcoded in `settings.py`** (`SECRET_KEY`, Stripe keys, Gmail app password) and
  need to move to environment variables before this is pushed publicly.
- **Currency mismatch.** The UI displays `Rs.` but Stripe charges are created in `usd`.
- **Orders page** — status filter tabs and pagination work; the "Invoice", "View Details" and
  "Buy Again" buttons on each order card are still static (no handlers wired up yet). There's no
  sort dropdown on this page.
- No automated tests — every app's `tests.py` is still a stub.
- `DEBUG = True` and SQLite — development configuration only.

---

## Notes

- The virtualenv lives at `env/` in the repo root, one level **above** `backend/`. From inside
  `backend/` that's `../env/bin/python`.
- React runs in StrictMode, so effects fire twice in development. The payment page guards against
  this with a `useRef`, and the backend uses a Stripe idempotency key — without both, two payment
  intents get created per order and the wrong one gets saved.
- Order emails go through Gmail SMTP and need an **app password** (Google account → Security →
  2-Step Verification → App passwords), not your normal password.
