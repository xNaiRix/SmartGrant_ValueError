from SmartGrant_ValueError.contract import MyCoinContract
from SmartGrant_ValueError.entities import PurchaseList, Object


def api_dadata_get_okved(tin: str) -> str:
    """Simulates Step 2: Getting Category from TIN"""
    db = {
        "7700000000": "47.11",  # Food Retail
        "1234567890": "99.99",  # Forbidden Category
    }
    return db.get(tin, "00.00")


def api_bank_process_payment(amount: float, tin: str) -> bool:
    """Simulates Step 3: SBP Payment"""
    # In real life, this calls the Bank API
    return True


def api_fns_parse_receipt(receipt_qr: str) -> PurchaseList:
    """Simulates Step 6: Getting Item List from FNS"""
    # In real life, queries FNS API
    if "valid_food" in receipt_qr:
        return PurchaseList(
            objects=[Object(name="Milk", cost=100.0, categories=["47.11"])],
            totalCost=100.0
        )
    elif "invalid_alcohol" in receipt_qr:
        return PurchaseList(
            objects=[Object(name="Vodka", cost=100.0, categories=["99.99"])],  # 99.99 not in budget
            totalCost=100.0
        )
    return PurchaseList(objects=[], totalCost=0.0)


def execute_grant_lifecycle(
        contract: MyCoinContract,
        stage: str,
        data: dict
):
    """
    One function to handle the 3 stages of the transaction.

    STAGES:
    1. 'INITIATE' (Steps 1-4): Scans Payment QR, Checks Logic, Pays, Starts Timer.
    2. 'FINALIZE' (Steps 5-7): Uploads Receipt, Validates, Reconciles.
    3. 'TIMEOUT'  (Step 8): Checks 24h deadline, Applies Sanctions.
    """

    print(f"\n--- EXECUTING STAGE: {stage} ---")

    if stage == "INITIATE":
        payment_qr = data.get("payment_qr")
        try:
            tin = payment_qr.split("|")[0].split(":")[1]
            amount = float(payment_qr.split("|")[1].split(":")[1])
        except:
            return "Error: Invalid QR Format"

        okved = api_dadata_get_okved(tin)

        response = contract.apply_transaction("initialVerification", spent=amount, OKVED=okved)

        if response['status'] == "ERROR":
            return f"Transaction Blocked: {response['message']}"

        if api_bank_process_payment(amount, tin):
            return "Payment Successful. Status: RECEIPT REQUIRED (24h timer started)."
        else:
            return "Bank Error: Payment Declined."

    elif stage == "FINALIZE":
        receipt_qr = data.get("receipt_qr")

        if not receipt_qr:
            return "Error: No receipt provided."

        receipt_obj = api_fns_parse_receipt(receipt_qr)

        response = contract.apply_transaction("verifyReceipt", receipt=receipt_obj)

        return f"Result: {response['result']}"

    elif stage == "TIMEOUT":
        pending = contract.state.get('transactionQueued')

        if not pending:
            return "No pending transactions to sanction."

        spent_amount = pending['amount']

        fake_timeout_list = PurchaseList(
            objects=[Object(
                name="TIMEOUT_PENALTY",
                cost=spent_amount,
                categories=["TIMEOUT_VIOLATION"]
            )],
            totalCost=spent_amount
        )
        response = contract.apply_transaction("verifyReceipt", receipt=fake_timeout_list)
        return f"TIMEOUT SANCTION APPLIED: {response['result']}"
    elif stage == "REPAY":
        amount_to_repay = data.get("amount")

        if not amount_to_repay or amount_to_repay <= 0:
            return "Error: Invalid repayment amount."

        # if not bank_api.receive_funds(amount_to_repay): return "Bank Error"

        response = contract.apply_transaction("payDebt", amount=amount_to_repay)

        if response['status'] == "ERROR":
            return f"Repayment Failed: {response['message']}"

        return f"Repayment Success: {response['result']}"

    elif stage == "UPDATE_BUDGET":
        # data['new_items'] должен быть списком словарей:
        # [{'name': 'Food', 'cost': 5000.0, 'categories': ['47.11']}, ...]
        raw_items = data.get("new_items", [])

        if not raw_items:
            return "Error: No new budget items provided."

        try:
            new_objects = [Object(**item) for item in raw_items]

            total_cost = sum(obj.cost for obj in new_objects)

            new_purchase_list = PurchaseList(objects=new_objects, totalCost=total_cost)

            response = contract.apply_transaction("rePriceItemList", newItemList=new_purchase_list)

            if response['status'] == "ERROR":
                return f"Update Failed: {response['message']}"

            return f"Update Success: {response['result']}"

        except Exception as e:
            return f"Data Error: {str(e)}"
    else:
        return "Error: Unknown Stage"
