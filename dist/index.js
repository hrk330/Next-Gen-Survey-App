"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./routes/user"));
const teams_1 = __importDefault(require("./routes/teams"));
const survey_1 = __importDefault(require("./routes/survey"));
const admin_1 = __importDefault(require("./routes/admin"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
// MongoDB Connection
const dbConnectionString = process.env.DB_CONNECTION_STRING;
const dbOptions = {
    serverSelectionTimeoutMS: 10000, // Adjust the timeout as needed
};
mongoose_1.default
    .connect(dbConnectionString, dbOptions
// Adjust the timeout as needed
)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
mongoose_1.default.set('debug', true);
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Survey App API Documentation",
            version: "1.0.0",
            description: "A survey app",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/controller/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// Routes
app.use('/api/user', user_1.default);
app.use('/api/teams', teams_1.default);
app.use('/api/survey', survey_1.default);
app.use('/api/admin', admin_1.default);
// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=index.js.map