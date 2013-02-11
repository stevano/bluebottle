from django.db import models
from django_extensions.db.fields import CreationDateTimeField, ModificationDateTimeField
from djchoices.choices import DjangoChoices, ChoiceItem


class ClieopBatch(models.Model):

    class ClieopTypes(DjangoChoices):
        payment = ChoiceItem('payment', label=_("Payment"))
        direct_debit = ChoiceItem('direct_debit', label=_("Direct debit"))

    type = models.CharField(_("type"), max_length=20, choices=ClieopTypes.choices)

    created = CreationDateTimeField(_("created"))
    updated = ModificationDateTimeField(_("updated"))

    class Meta:
        db_table = "payments_clieop_batch"


class ClieopLine(models.Model):

    clieop_batch = models.ForeignKey(ClieopBatch)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    sender_account_number = models.CharField(max_length=100)
    receiver_account_number = models.CharField(max_length=100)

    invoice_reference =  models.CharField(max_length=100)
    description_line1 =  models.CharField(max_length=100, blank=True, default="")
    description_line2 =  models.CharField(max_length=100, blank=True, default="")
    description_line3 =  models.CharField(max_length=100, blank=True, default="")
    description_line4 =  models.CharField(max_length=100, blank=True, default="")

    class Meta:
        abstract = True


class ClieopPaymentLine(ClieopLine):

    receiver_account_name = models.CharField(max_length=100)
    receiver_account_city = models.CharField(max_length=100)


    class Meta:
        db_table = "payments_clieop_payment_line"


class ClieopDirectDebitLine(ClieopLine):

    sender_account_name = models.CharField(max_length=100)
    sender_account_city = models.CharField(max_length=100)

    class Meta:
        db_table = "payments_clieop_directdebit_line"

