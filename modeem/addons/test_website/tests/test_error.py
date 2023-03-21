import modeem.tests
from modeem.tools import mute_logger


@modeem.tests.common.tagged('post_install', '-at_install')
class TestWebsiteError(modeem.tests.HttpCase):

    @mute_logger('modeem.addons.http_routing.models.ir_http', 'modeem.http')
    def test_01_run_test(self):
        self.start_tour("/test_error_view", 'test_error_website')
