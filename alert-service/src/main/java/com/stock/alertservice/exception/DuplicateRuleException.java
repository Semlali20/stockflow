package com.stock.alertservice.exception;

/**
 * Exception lancée quand on tente de créer une règle avec un nom déjà existant
 */
public class DuplicateRuleException extends BusinessException {

    public DuplicateRuleException(String ruleName) {
        super(String.format("Rule with name '%s' already exists", ruleName), "DUPLICATE_RULE");
    }

    public DuplicateRuleException(String message, String errorCode) {
        super(message, errorCode);
    }
}
