# Based on php file
from datetime import datetime
from apps.clieop.models import ClieopBatch, ClieopDirectDebitLine, ClieopPaymentLine


class ClieopFactory(object):

    batch = None

    def create(self, *args, **kwargs):
        if not 'type' in kwargs:
            raise Exception("Type not specified. Select 'payment' or 'direct_debit'.")

        if not 'sender_id' in kwargs:
            raise Exception("Sender_id not set. Set any code up to 5 characters.")

        if not 'batch_id' in kwargs:
            kwargs['batch_id'] = 1

        self.batch = ClieopBatch.objects.create(kwargs)
        return self.batch


    def add_payment(self, *args, **kwargs):
        if not self.batch:
            raise Exception("No ClieopBatch found. Create one with create_batch.")
        if self.batch.type != ClieopBatch.ClieopTypes.payment:
            raise Exception("Can't add Payment to batch of type '{0}'.".format(self.batch.type))

        assert 'amount' in kwargs
        # Our info
        assert 'sender_account_number' in kwargs

        # Their info
        assert 'receiver_account_number' in kwargs
        assert 'receiver_account_number' in kwargs
        assert 'receiver_account_name' in kwargs
        assert 'receiver_account_city' in kwargs

        return ClieopPaymentLine.objects.create(clieop_batch=self.batch, kwargs)


    def add_direct_debit(self, *args, **kwargs):
        if not self.batch:
            raise Exception("No ClieopBatch found. Create one with create_batch.")
        if self.batch.type != ClieopBatch.ClieopTypes.direct_debit:
            raise Exception("Can't add Direct Debit to batch of type '{0}'.".format(self.batch.type))

        assert 'amount' in kwargs
        assert 'invoice_reference' in kwargs
        # optional params:
        # * description_line1
        # * description_line2
        # * description_line3
        # * description_line4

        # Our info
        assert 'receiver_account_number' in kwargs

        # Their info
        assert 'sender_account_number' in kwargs
        assert 'sender_account_name' in kwargs
        assert 'sender_account_city' in kwargs

        return ClieopDirectDebitLine.objects.create(clieop_batch=self.batch, kwargs)

    def generate(self):
        if not self.batch:
            raise Exception("No ClieopBatch found. Create one with create_batch.")

        contents = self._file_info()


    # Methods for generating the Clieop file

    def _write_file_info(self):
        """
        text  = "0001";										#infocode
        text += "A";											#variantcode
        text += date("dmy");									#aanmaak datum
        text += "CLIEOP03";									#bestands naam
        text += $this->alfaFiller($identifier, 5);				#afzender identificatie
        text += date("d") . $this->numFiller($batchCount, 2);	#bestands identificatie
        text += "1";											#duplicaat code
        text += $this->filler(21);	
        """
        # Info Code
        text = "0001"
        # Variant code
        text += "A"
        text += datetime.strftime('dmY')
        text += "CLIEOP03"
        text += "1"
        pass
