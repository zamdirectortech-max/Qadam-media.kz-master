from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class CheckoutSession:
    provider: str
    checkout_url: str


class BillingService(ABC):
    @abstractmethod
    async def create_checkout(self, organization_id: str, plan: str) -> CheckoutSession:
        raise NotImplementedError


class AbstractBillingService(BillingService):
    async def create_checkout(self, organization_id: str, plan: str) -> CheckoutSession:
        raise NotImplementedError("Billing provider is not configured")
