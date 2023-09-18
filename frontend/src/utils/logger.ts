import winston from 'winston'

const config = {
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
}

const logger = winston.createLogger(config)

export default logger
