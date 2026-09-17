<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Helpers;

/**
 * User-facing exception with translation support
 */
class UserException extends \BgaUserException
{
    /**
     * @param string $str Exception message (will be client-translated)
     */
    public function __construct(string $str)
    {
        parent::__construct(clienttranslate($str));
    }
}
