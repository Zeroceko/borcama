import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import marketPrices from './api/market-prices.js'
import fundPrices from './api/fund-prices.js'
import stockPrices from './api/stock-prices.js'

function localMarketPrices() {
  return {
    name: 'borcama-local-market-prices',
    configureServer(server) {
      server.middlewares.use('/api/market-prices', async (req, res) => {
        const cevap = {
          setHeader: (ad, deger) => res.setHeader(ad, deger),
          status(kod) {
            res.statusCode = kod
            return this
          },
          json(veri) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(veri))
          },
        }
        await marketPrices(req, cevap)
      })
      server.middlewares.use('/api/fund-prices', async (req, res) => {
        const cevap = {
          setHeader: (ad, deger) => res.setHeader(ad, deger),
          status(kod) {
            res.statusCode = kod
            return this
          },
          json(veri) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(veri))
          },
        }
        await fundPrices(req, cevap)
      })
      server.middlewares.use('/api/stock-prices', async (req, res) => {
        const cevap = {
          setHeader: (ad, deger) => res.setHeader(ad, deger),
          status(kod) {
            res.statusCode = kod
            return this
          },
          json(veri) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(veri))
          },
        }
        await stockPrices(req, cevap)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localMarketPrices()],
})
