# Installing Stripe CLI on macOS

## Option 1: Using Homebrew (Recommended)

### Step 1: Check if Homebrew is installed

```bash
which brew
```

If it shows a path (like `/opt/homebrew/bin/brew` or `/usr/local/bin/brew`), you have Homebrew installed. Skip to Step 2.

If it says "command not found", install Homebrew first:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
```

### Step 3: Verify Installation

```bash
stripe --version
```

You should see something like: `stripe version 1.x.x`

### Step 4: Login to Stripe

```bash
stripe login
```

This will open your browser to authorize the CLI.

---

## Option 2: Manual Installation (If Homebrew doesn't work)

### Step 1: Download Stripe CLI

1. Go to: https://github.com/stripe/stripe-cli/releases
2. Download the latest `stripe_X.X.X_darwin_amd64.tar.gz` (for Intel Mac) or `stripe_X.X.X_darwin_arm64.tar.gz` (for Apple Silicon/M1/M2)
3. Extract the archive:
   ```bash
   tar -xzf stripe_X.X.X_darwin_amd64.tar.gz
   ```

### Step 2: Move to a directory in your PATH

```bash
# For Apple Silicon (M1/M2)
sudo mv stripe /opt/homebrew/bin/

# For Intel Mac
sudo mv stripe /usr/local/bin/
```

### Step 3: Make it executable

```bash
chmod +x /opt/homebrew/bin/stripe  # or /usr/local/bin/stripe
```

### Step 4: Verify Installation

```bash
stripe --version
```

---

## Option 3: Using npm (Alternative)

You can also install it via npm:

```bash
npm install -g stripe-cli
```

Then use it:
```bash
stripe login
```

---

## Troubleshooting

### Issue: "command not found" after installation

**Solution:** Make sure the Stripe CLI is in your PATH:

```bash
# Check where it was installed
which stripe

# If not found, add to PATH (add to ~/.zshrc)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc  # Apple Silicon
# OR
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc  # Intel

# Reload shell
source ~/.zshrc
```

### Issue: Permission denied

**Solution:** Make sure the file is executable:

```bash
chmod +x $(which stripe)
```

---

## After Installation

Once Stripe CLI is installed, you can:

1. **Login:**
   ```bash
   stripe login
   ```

2. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook/stripe
   ```

3. **Trigger test events:**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

---

## Quick Check

Run this to verify everything is set up:

```bash
stripe --version && echo "✅ Stripe CLI installed" || echo "❌ Stripe CLI not found"
```
