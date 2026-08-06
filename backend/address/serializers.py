from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'first_name', 'last_name', 'phone',
                  'address_line_1', 'address_line_2', 'country',
                  'state', 'city', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']



    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
