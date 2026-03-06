// 1. Helpers para evitar repetição de estrutura JSON
const JSON_CONTENT = (schemaName: string) => ({
  "application/json": {
    schema: { $ref: `#/components/schemas/${schemaName}` }
  }
});

// 2. Parâmetros reutilizáveis
const TRANSACTION_ID_PARAM = {
  name: "transactionId",
  in: "path",
  required: true,
  schema: { type: "string" }
};

// 3. Respostas de erro padronizadas
const COMMON_ERRORS = {
  VALIDATION: {
    description: "Erro de validacao",
    content: JSON_CONTENT("ErrorResponse")
  },
  NOT_FOUND: {
    description: "Recurso nao encontrado",
    content: JSON_CONTENT("ErrorResponse")
  }
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Mini Fintech API",
    version: "1.0.0",
    description: "API para processamento de transacoes financeiras com arquitetura hexagonal"
  },
  servers: [{ url: "/api", description: "Base path local" }],
  tags: [
    { name: "Users" },
    { name: "Cards" },
    { name: "Transactions" },
    { name: "Invoices" }
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Invalid input" }
            },
            required: ["code", "message"]
          }
        },
        required: ["error"]
      },
      CreateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Alice" },
          email: { type: "string", format: "email", example: "alice@mail.com" },
          password: { type: "string", minLength: 8, example: "12345678" }
        },
        required: ["name", "email", "password"]
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "email", "createdAt"]
      },
      CreateCardRequest: {
        type: "object",
        properties: {
          userId: { type: "string", example: "user-id" },
          cardNumber: {
            type: "string",
            pattern: String.raw`^\d{16}$`,
            example: "1234123412341234"
          },
          limitCents: { type: "integer", minimum: 100, example: 500000 }
        },
        required: ["userId", "cardNumber", "limitCents"]
      },
      CardResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          last4: { type: "string", example: "1234" },
          limitCents: { type: "integer" },
          availableLimitCents: { type: "integer" },
          status: { type: "string", enum: ["ACTIVE", "BLOCKED"] },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["id", "userId", "last4", "limitCents", "availableLimitCents", "status", "createdAt"]
      },
      ProcessTransactionRequest: {
        type: "object",
        properties: {
          userId: { type: "string", example: "user-id" },
          cardId: { type: "string", example: "card-id" },
          amountCents: { type: "integer", minimum: 1, example: 10000 },
          description: { type: "string", example: "Compra mercado" }
        },
        required: ["userId", "cardId", "amountCents", "description"]
      },
      TransactionResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          cardId: { type: "string" },
          userId: { type: "string" },
          amountCents: { type: "integer" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["PENDING", "APPROVED", "DECLINED", "CANCELLED", "CHARGEBACK"]
          },
          referenceMonth: { type: "string", example: "2026-03" },
          createdAt: { type: "string", format: "date-time" },
          cancelledAt: { type: "string", format: "date-time", nullable: true },
          chargebackAt: { type: "string", format: "date-time", nullable: true }
        },
        required: ["id", "cardId", "userId", "amountCents", "description", "status", "referenceMonth", "createdAt"]
      },
      InvoiceResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          cardId: { type: "string" },
          userId: { type: "string" },
          referenceMonth: { type: "string", example: "2026-03" },
          totalCents: { type: "integer" },
          transactionIds: { type: "array", items: { type: "string" } },
          generatedAt: { type: "string", format: "date-time" }
        },
        required: ["id", "cardId", "userId", "referenceMonth", "totalCents", "transactionIds", "generatedAt"]
      }
    }
  },
  paths: {
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Criar usuario",
        requestBody: { required: true, content: JSON_CONTENT("CreateUserRequest") },
        responses: {
          "201": { description: "Usuario criado", content: JSON_CONTENT("UserResponse") },
          "400": COMMON_ERRORS.VALIDATION
        }
      }
    },
    "/cards": {
      post: {
        tags: ["Cards"],
        summary: "Criar cartao",
        requestBody: { required: true, content: JSON_CONTENT("CreateCardRequest") },
        responses: {
          "201": { description: "Cartao criado", content: JSON_CONTENT("CardResponse") },
          "404": COMMON_ERRORS.NOT_FOUND
        }
      }
    },
    "/transactions": {
      post: {
        tags: ["Transactions"],
        summary: "Processar transacao",
        requestBody: { required: true, content: JSON_CONTENT("ProcessTransactionRequest") },
        responses: {
          "201": { description: "Transacao processada", content: JSON_CONTENT("TransactionResponse") }
        }
      }
    },
    "/transactions/{transactionId}/cancel": {
      post: {
        tags: ["Transactions"],
        summary: "Cancelar transacao",
        parameters: [TRANSACTION_ID_PARAM],
        responses: {
          "200": { description: "Transacao cancelada", content: JSON_CONTENT("TransactionResponse") }
        }
      }
    },
    "/transactions/{transactionId}/chargeback": {
      post: {
        tags: ["Transactions"],
        summary: "Simular chargeback",
        parameters: [TRANSACTION_ID_PARAM],
        responses: {
          "200": { description: "Chargeback aplicado", content: JSON_CONTENT("TransactionResponse") }
        }
      }
    },
    "/cards/{cardId}/invoice": {
      get: {
        tags: ["Invoices"],
        summary: "Gerar ou consultar fatura mensal",
        parameters: [
          { name: "cardId", in: "path", required: true, schema: { type: "string" } },
          { name: "referenceMonth", in: "query", required: true, schema: { type: "string", example: "2026-03" } }
        ],
        responses: {
          "200": { description: "Fatura do mes", content: JSON_CONTENT("InvoiceResponse") }
        }
      }
    }
  }
} as const;