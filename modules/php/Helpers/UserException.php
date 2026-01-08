<?php
namespace AKR\Helpers;
use AKR\Core\Game;

class UserException extends \BgaUserException
{
  public function __construct($str)
  {
    parent::__construct(clienttranslate($str));
  }
}
?>
