import modeem.tests
from modeem.tools import mute_logger


@modeem.tests.common.tagged('post_install', '-at_install')
class TestWebsiteSession(modeem.tests.HttpCase):

    def test_01_run_test(self):
        self.start_tour('/', 'test_json_auth')
