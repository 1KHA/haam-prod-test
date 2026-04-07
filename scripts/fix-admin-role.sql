-- Fix invalid user roles by setting them to ENTREPRENEUR (default role)
-- Valid roles: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, ENTREPRENEUR
UPDATE User SET role = 'ADMIN' WHERE email LIKE '%admin%';
UPDATE User SET role = 'ENTREPRENEUR' WHERE role NOT IN ('ADMIN','PROGRAM_MANAGER','MENTOR','INVESTOR','ENTREPRENEUR');
