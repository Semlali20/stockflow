package com.stock.alertservice.exception;

/**
 * Exception lancée quand une règle n'est pas trouvée
 */
public class RuleNotFoundException extends ResourceNotFoundException {

    public RuleNotFoundException(String ruleId) {
        super("Rule", "id", ruleId);
    }

    public RuleNotFoundException(String fieldName, Object fieldValue) {
        super("Rule", fieldName, fieldValue);
    }


}
