UPDATE Usuario SET tokenVersion = COALESCE(tokenVersion,0) + 1;
