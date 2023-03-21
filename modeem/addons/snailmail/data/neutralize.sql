INSERT INTO ir_config_parameter (key, value)
VALUES ('snailmail.endpoint', 'https://iap-services-test.modeem.com')
    ON CONFLICT (key) DO
       UPDATE SET value = 'https://iap-services-test.modeem.com';
