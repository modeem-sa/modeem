INSERT INTO ir_config_parameter (key, value)
VALUES ('iap.endpoint', 'https://iap-sandbox.modeem.com')
    ON CONFLICT (key) DO
       UPDATE SET value = 'https://iap-sandbox.modeem.com';
