/*eslint-env node, mocha*/
const { expect } = require('chai');
const Bluebird   = require('bluebird');
const RabbitMQ   = require('../../../lib/rabbitmq/interface.js');

const URL        = 'amqp://localhost'
const QUEUE_NAME = 'rabbitmq-test';


describe('Rabbit MQ Interface Library', function() {

  beforeEach(function() {

    return RabbitMQ.Factory({ url: URL })
      .then((rabbitmq) => rabbitmq.delete(QUEUE_NAME))
    ;

  });


  it('provided a send and listen interface', function(done) {

    const test_message = { foo: 'bar' };
    const queue        = { name: 'rabbitmq-test' };

    const responses    = [];


    RabbitMQ.Factory({ url: URL }).then((rabbitmq) => {

      const runTest = () => setTimeout(() => {

        expect(responses.length).to.eql(2);
        expect(responses).to.deep.eql([ test_message, test_message ]);

        done();

      }, 200);

      rabbitmq.listen(queue , (msg) => new Bluebird((resolve) => {
        responses.push(msg);

        if(responses.length > 1) runTest();

        return resolve(true);

      }))
    })

    .catch(done);


    RabbitMQ.Factory({ url: URL }).then((rabbitmq) => {

      rabbitmq.send(queue, test_message);
      rabbitmq.send(queue, test_message);

    })
      
    .catch(done);

  });

});
