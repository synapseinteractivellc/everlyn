// js/controllers/currency-controller.js
class CurrencyController {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    update(deltaTime) {
        this.updateCurrencies(deltaTime / 1000); // Convert to seconds
    }
    
    updateCurrencies(deltaTimeSeconds) {
        for (const currency of Object.values(this.gameState.currencies)) {
            if (currency.generationRate > 0) {
                currency.amount += currency.generationRate * deltaTimeSeconds;
            }
        }
    }
    
    addCurrency(currencyId, amount) {
        if (this.gameState.currencies[currencyId]) {
            this.gameState.currencies[currencyId].amount += amount;
            return true;
        }
        return false;
    }
    
    spendCurrency(currencyId, amount) {
        if (this.gameState.currencies[currencyId] && this.gameState.currencies[currencyId].amount >= amount) {
            this.gameState.currencies[currencyId].amount -= amount;
            return true;
        }
        return false;
    }
    
    hasCurrency(currencyId, amount) {
        return this.gameState.currencies[currencyId] && this.gameState.currencies[currencyId].amount >= amount;
    }
    
    updateGenerationRate(currencyId, newRate) {
        if (this.gameState.currencies[currencyId]) {
            this.gameState.currencies[currencyId].generationRate = newRate;
            return true;
        }
        return false;
    }
}