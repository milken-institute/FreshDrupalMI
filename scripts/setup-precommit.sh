#!/usr/bin/env php
<?php

copy("scripts/pre-commit",".git/hooks/pre-commit");
chmod(".git/hooks/pre-commit", 0777);

