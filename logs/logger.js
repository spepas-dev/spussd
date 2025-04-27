const winston = require("winston");
const {
  ElasticsearchTransformer,
  ElasticsearchTransport,
  LogData,
  TransformedData,
} = require("winston-elasticsearch");

const esTransformer = (logData) => {
  return ElasticsearchTransformer(logData);
};

//Label
const CATEGORY = "Spepas USSD Service API Log";

const winstonLogger = (elasticsearchNode, name, level) => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      json: false,
      colorize: true,
    },
    elasticsearch: {
      level,
      transformer: esTransformer,
      clientOpts: {
        node: elasticsearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false,
      },
    },
  };
  const esTransport = new ElasticsearchTransport(options.elasticsearch);
  const logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    format: combine(
      errors({ stack: true }),
      label({ label: CATEGORY }),
      json()
    ),
    transports: [new winston.transports.Console(options.console), esTransport],
  });
  return logger;
};

module.exports = { winstonLogger };
