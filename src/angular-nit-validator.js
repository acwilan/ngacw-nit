angular.module('nicetech.directives', [])
    .directive('nit', function () {
        function clearValue(value) {
            if (!value) {
                return value;
            }
            return value.trim().toUpperCase().replace(/[^0-9A-Z\/]/g, '');
        }

        function applyNitMask(modelValue) {
            if (!modelValue) {
                return modelValue;
            }
            var value = modelValue.trim().toUpperCase();
            if (value === 'CF' || value === 'C/F') {
                return 'CF';
            }
            if (value.length > 1) {
                value = value.substr(0, value.length - 1) + '-' + value.substr(value.length - 1);
            }

            return value;
        }

        function validNit(modelValue) {
            // en el caso de los NIT que terminan en K, se convierte a mayúsculas
            var nit = modelValue.toUpperCase();

            if (nit === 'CF' || nit === 'C/F') {
                return true;
            }

            var pos = nit.indexOf('-');

            if (pos < 0) {
                var correlativo = nit.substr(0, nit.length - 1);
                correlativo = correlativo + '-';

                var pos2 = correlativo.length - 2;
                var digito = nit.substr(pos2 + 1);
                nit = correlativo + digito;
                pos = nit.indexOf('-');
            }

            var correlativo = nit.substr(0, pos);
            var DigitoVerificador = nit.substr(pos + 1);

            var Factor = correlativo.length + 1;
            var Suma = 0;

            for (var x = 0; x <= (pos - 1); x++) {
                Suma += (parseInt(nit.substr(x, 1), 10)) * Factor;
                Factor--;
            }

            var xMOd11 = (11 - (Suma % 11)) % 11;
            if ((xMOd11 === 10 && DigitoVerificador === 'K') || (xMOd11 === parseInt(DigitoVerificador, 10))) {
                return true;
            }

            return false;
        }

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function postLink(scope, element, attrs, ctrl) {
                ctrl.$formatters.push(function (value) {
                    return applyNitMask(value);
                });

                ctrl.$parsers.push(function (value) {
                    if (!value) {
                        return value;
                    }

                    var cleanValue = clearValue(value);
                    var formatedValue = applyNitMask(cleanValue);

                    if (ctrl.$viewValue !== formatedValue) {
                        ctrl.$setViewValue(formatedValue);
                        ctrl.$render();
                    }

                    return clearValue(formatedValue);
                });

                ctrl.$validators.validNit = function (modelValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return true;
                    }
                    return validNit(modelValue);
                };
            }
        };
    });