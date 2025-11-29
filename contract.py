from copy import deepcopy
from entities import PurchaseList, Object


class SmartContract:
    def __init__(self):
        self.state = {}

    def apply_transaction(self, func_name, **kwargs):
        """
        Engine that makes safe transaction with rollback capability
        """
        snapshot = deepcopy(self.state)

        try:
            func = getattr(self, func_name)
            result = func(**kwargs)
            return {"status": "SUCCESS", "result": result, "new_state": self.state}
        except Exception as e:
            self.state = snapshot
            return {"status": "ERROR", "message": str(e)}


class MyCoinContract(SmartContract):
    def __init__(self, itemList: PurchaseList):
        super().__init__()
        self.state = {
            "balance": itemList.totalCost,  # Total money available in the grant
            "items": itemList.objects,  # List of allowed budget items (The Estimate/Smeta)
            'frozen': False,
            'Debt': 0,
            'transactionQueued': None  # Changed to None to store the current active tx
        }

    def initialVerification(self, spent, OKVED):
        """
        Step 1: Pre-check before payment
        Checks limits and category.
        """
        if spent <= 0:
            raise ValueError('You must spend at least some money.')

        if self.state.get('frozen', False):
            raise ValueError('Your account is currently frozen due to previous violations.')

        max_available_money = 0
        for i in self.state.get('items', []):
            if OKVED in i.categories:
                max_available_money += i.cost

        if max_available_money < spent:
            raise ValueError(f'Insufficient funds for category {OKVED}. Available: {max_available_money}')

        self.state['transactionQueued'] = {
            "amount": spent,
            "expected_category": OKVED
        }

        return 'Initially verified. Waiting for receipt...'

    def verifyReceipt(self, receipt: PurchaseList):
        """
        Step 2: Post-check. Validates specific items from the receipt.
        """
        pending_tx = self.state.get('transactionQueued')
        if not pending_tx:
            raise ValueError("No pending transaction found. Scan payment QR first.")

        if abs(receipt.totalCost - pending_tx['amount']) > 1.0:
            # Depanding on fee percentages this would be changed
            pass

        invalid_spend_amount = 0

        for receipt_item in receipt.objects:
            match_found = False

            for budget_item in self.state['items']:
                common_categories = set(receipt_item.categories).intersection(set(budget_item.categories))

                if common_categories and budget_item.cost >= receipt_item.cost:
                    budget_item.cost -= receipt_item.cost
                    match_found = True
                    break

            if not match_found:
                invalid_spend_amount += receipt_item.cost

        self.state['balance'] -= receipt.totalCost

        del self.state['transactionQueued'][0]

        if invalid_spend_amount > 0:
            self.state['Debt'] += invalid_spend_amount
            self.freeze()
            return f"Warning! Receipt contained invalid items. Debt: {invalid_spend_amount}. Account Frozen."

        return "Receipt verified successfully. Transaction cleared."

    def payDebt(self, amount):
        """
        Allows the user to return money to unfreeze the account.
        """
        if amount <= 0:
            raise ValueError("Amount must be positive")

        if self.state['Debt'] == 0:
            raise ValueError("You have no debt.")

        self.state['Debt'] -= amount

        self.state['balance'] += amount

        if self.state['Debt'] <= 0:
            if self.state['Debt'] < 0:
                self.state['Debt'] = 0

            self.state['frozen'] = False
            return "Debt paid off. Account Unfrozen."

        return f"Debt reduced. Remaining debt: {self.state['Debt']}"

    def freeze(self):
        self.state['frozen'] = True

    def rePriceItemList(self, newItemList: PurchaseList):
        """
        Updates the grant budget (Smeta).
        Allows moving funds between categories or changing the total amount.
        """
        if self.state.get('frozen', False):
            raise ValueError('Cannot re-price items while account is frozen.')

        if self.state.get('transactionQueued') is not None:
            raise ValueError(
                'Cannot re-price items while a transaction is pending. Please complete or cancel current payment first.')

        if newItemList.totalCost < 0:
            raise ValueError('Total grant cost cannot be negative.')

        self.state['items'] = newItemList.objects

        self.state['balance'] = newItemList.totalCost

        return "Grant estimate (smeta) successfully updated."