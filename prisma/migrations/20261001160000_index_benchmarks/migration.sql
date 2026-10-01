-- The dashboard's market bar shows the Dow and the Russell 2000 next to the
-- S&P 500 and NASDAQ, through the ETFs that track them. The price job prices
-- every instrument, so these only need to exist.
INSERT INTO "Instrument" ("ticker", "name", "kind", "currency")
VALUES ('DIA', 'Dow Jones', 'BENCHMARK', 'USD'), ('IWM', 'Russell 2000', 'BENCHMARK', 'USD')
ON CONFLICT ("ticker") DO NOTHING;
