import warnings
import modeem.http


def application(environ, start_response):

    warnings.warn("The WSGI application entrypoint moved from "
                  "modeem.service.wsgi_server.application to modeem.http.root "
                  "in 15.3.",
                  DeprecationWarning, stacklevel=1)
    return modeem.http.root(environ, start_response)
