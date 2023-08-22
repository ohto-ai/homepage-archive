#!/usr/bin/env python
# -*- coding:utf-8 -*-
# @author: Ohto-Ai
import subprocess
import tornado.web
import tornado.ioloop
import html
from tornado.options import define,options,parse_command_line

define('port',default=8007,help='run on the port',type=int)
class MainHandler(tornado.web.RequestHandler):
    def post(self):
        shell_command = self.get_argument("command")
        print("command " + shell_command+ "\n")
        screen_str = subprocess.Popen(shell_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        screen_str.wait()
        out_msg=str(screen_str.stdout.read(), 'utf-8')
        err_msg=str(screen_str.stderr.read(), 'utf-8')
        msg=out_msg+err_msg
        msg=html.escape(msg);
        msg=msg.replace(" ","&nbsp;")
        msg=msg.replace("\n","<br>")
        print(msg)
        self.set_header('Content-Type', 'text/plain; charset=UTF-8')
        self.write(msg)
        self.finish()

def main():
    parse_command_line()
    app=tornado.web.Application(
            [
                (r'/',MainHandler),
                ],
            )

    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__=='__main__':
    main()
 
 