# Configuração do Stripe - Frontend

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Chave pública (publishable key) do Stripe
3. Backend configurado com Stripe (Laravel Cashier)

## 🔧 Configuração

### 1. Obter Chave Pública do Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá em **Developers** > **API keys**
3. Copie a **Publishable key** (começa com `pk_test_` para testes ou `pk_live_` para produção)

### 2. Configurar Variável de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto `frontend/`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
```

**Importante:** 
- Use `pk_test_` para desenvolvimento/testes
- Use `pk_live_` apenas em produção
- Nunca commite a chave no Git (adicione `.env` ao `.gitignore`)

### 3. Verificar Instalação

As dependências já foram instaladas:
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

## 🚀 Como Funciona

### Fluxo de Assinatura

1. **PlansPage** - Usuário visualiza planos disponíveis
2. **CheckoutPage** - Usuário seleciona plano e vai para checkout
3. **CheckoutForm** - Formulário Stripe PaymentElement
4. **Backend** - Cria assinatura via Laravel Cashier
5. **Stripe** - Processa pagamento
6. **SuccessPage** - Confirmação de sucesso

### Componentes Criados

- `lib/stripe.ts` - Configuração do Stripe
- `components/CheckoutForm.tsx` - Formulário de pagamento
- `pages/CheckoutPage.tsx` - Página de checkout
- `pages/SubscriptionSuccessPage.tsx` - Página de sucesso

## 🧪 Testar

### Cartões de Teste do Stripe

Use estes cartões para testar:

**Sucesso:**
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura (ex: `12/34`)
- CVC: Qualquer 3 dígitos (ex: `123`)

**Falha:**
- Número: `4000 0000 0000 0002`
- Data: Qualquer data futura
- CVC: Qualquer 3 dígitos

Mais cartões de teste: https://stripe.com/docs/testing

## 📝 Notas Importantes

- A chave pública é segura para usar no frontend
- A chave secreta deve estar apenas no backend
- Em produção, use chaves `live_` do Stripe
- Configure webhooks no Stripe Dashboard para eventos de assinatura

## 🔗 Links Úteis

- [Documentação Stripe](https://stripe.com/docs)
- [Stripe React SDK](https://stripe.com/docs/stripe-js/react)
- [Payment Element](https://stripe.com/docs/payments/payment-element)

